'use client';

import AppLogo from '@/components/AppLogo'
import { author, currentYear } from '@/helpers'
import Link from 'next/link'
import { Button, Card, Col, Container, Form, FormControl, FormLabel, Row } from 'react-bootstrap';
import { signInWithCredentials } from '@/actions/user-actions';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { TbArrowRight, TbEye, TbEyeOff } from 'react-icons/tb';

//export const metadata= { title: "Sign In" }

const SignInPage = () => {
    const [data, action] = useActionState(signInWithCredentials, {
        success: false,
        message: '',
    });

    const [visible, setVisible] = useState(false);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    const SignInButton = () => {
        const { pending } = useFormStatus();
        return (
        <Button type='submit' disabled={pending} className="btn-primary fw-semibold py-2">
            {pending ? 'Signing In...' : 'Sign In'} 
            <TbArrowRight style={{ width: 20, height: 20 }} className="ms-1" />
        </Button>
        );
    };

  return (
      <Container>
                <Row className="justify-content-center">
                    <Col xxl={6} md={6} sm={8}>
                        <div className="auth-brand text-center mb-4">
                            <AppLogo />
                            <p className="text-muted w-lg-75 mx-auto mt-4">Let’s get you signed in. Enter your email and password to continue.</p>
                        </div>

                        <Card className="p-4 rounded-4">
                            <Form action={action} >
                                <div className="mb-3 form-group" >
                                    <FormLabel>
                                        Email address <span className="text-danger">*</span>
                                    </FormLabel>
                                    <div className="input-group">
                                    <FormControl 
                                    type="email" 
                                    id="email" 
                                    name='email' 
                                    required
                                    value={email} // 2. Bind value to state
                                    onChange={(e) => setEmail(e.target.value)}  />
                                    <span className="input-group-text" id="basic-addon1">@</span>
                                </div>
                                </div>
                                <div className="mb-3 form-group" >
                                    <FormLabel>
                                        Password <span className="text-danger">*</span>
                                    </FormLabel>
                                    <div className="input-group">
                                    <FormControl 
                                    type={visible ? "text" : "password"} 
                                    id="password" 
                                    name='password'                                     
                                    required
                                    value={password} // 2. Bind value to state
                                    onChange={(e) => setPassword(e.target.value)}  />
                                     <span onClick={() => setVisible(!visible)} className='input-group-text cursor-pointer'>
                                        {!visible ? <TbEyeOff style={{ width: 18, height: 18 }} /> : <TbEye style={{ width: 18, height: 18 }} />} 
                                    </span>
                                </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="form-check">
                                        <input className="form-check-input form-check-input-light fs-14" type="checkbox" id="rememberMe" />
                                        <label className="form-check-label" htmlFor="rememberMe">Keep me signed in</label>
                                    </div>
                                    <Link href="/auth-1/reset-password" className="text-decoration-underline link-offset-3 text-muted">Forgot Password?</Link>
                                </div>
                                <div className="d-grid">
                                    <SignInButton />
                                </div>
                            </Form>
                                {data && !data.success && (
                                        <div className='text-center text-danger mt-2'>{data.message}</div>
                                        )}

                            <p className="text-muted text-center mt-4 mb-0">
                                New here?{' '}
                                <Link href="/signup" className="text-secondary text-decoration-underline link-offset-3 fw-semibold">
                                    Create an account
                                </Link>
                            </p>
                        </Card>
                            <p className="text-center text-muted mt-4 mb-0">
                                © {currentYear} Developed — by <span className="fw-semibold">{author}</span>
                            </p>
                    </Col>
                </Row>
            </Container>
  )
}

export default SignInPage